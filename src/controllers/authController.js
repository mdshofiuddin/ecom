const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');
const { regenerateSessionWithUser } = require('../utils/sessionHelper');

class AuthController {
  static showLogin(req, res) {
    res.render('pages/login', {
      title: 'Sign In | ApexStore',
      validationErrors: [],
      formData: {}
    });
  }

  static async processLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = User.findByEmail(email);

      if (!user) {
        logSecurityEvent('FAILED_LOGIN_UNKNOWN_USER', null, req.ip, `Email attempt: ${email}`);
        return res.status(401).render('pages/login', {
          title: 'Sign In | ApexStore',
          validationErrors: ['Invalid email or password.'],
          formData: { email }
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        logSecurityEvent('FAILED_LOGIN_WRONG_PASSWORD', user.id, req.ip, `User: ${user.email}`);
        return res.status(401).render('pages/login', {
          title: 'Sign In | ApexStore',
          validationErrors: ['Invalid email or password.'],
          formData: { email }
        });
      }

      // Session Fixation Protection: Regenerate session ID upon privilege elevation
      regenerateSessionWithUser(req, user, (err) => {
        if (err) return next(err);
        logSecurityEvent('SUCCESSFUL_LOGIN', user.id, req.ip, `Role: ${user.role}`);
        const returnTo = req.session.returnTo || (user.role === 'admin' ? '/admin/dashboard' : '/');
        delete req.session.returnTo;
        res.redirect(returnTo);
      });
    } catch (error) {
      next(error);
    }
  }

  static showRegister(req, res) {
    res.render('pages/register', {
      title: 'Create Account | ApexStore',
      validationErrors: [],
      formData: {}
    });
  }

  static async processRegister(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const existingUser = User.findByEmail(email);

      if (existingUser) {
        return res.status(400).render('pages/register', {
          title: 'Create Account | ApexStore',
          validationErrors: ['An account with this email address already exists.'],
          formData: { name, email }
        });
      }

      // Hash password with 12 salt rounds
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = User.create({
        name,
        email,
        password: hashedPassword,
        role: 'customer'
      });

      // Regenerate session for newly authenticated user
      regenerateSessionWithUser(req, newUser, (err) => {
        if (err) return next(err);
        logSecurityEvent('USER_REGISTERED', newUser.id, req.ip, `New account: ${newUser.email}`);
        res.redirect('/?success=Account created successfully! Welcome to ApexStore.');
      });
    } catch (error) {
      next(error);
    }
  }

  static logout(req, res) {
    const userId = req.session?.user?.id;
    if (userId) {
      logSecurityEvent('USER_LOGOUT', userId, req.ip, 'User logged out');
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/auth/login?success=You have safely logged out.');
    });
  }
}

module.exports = AuthController;
