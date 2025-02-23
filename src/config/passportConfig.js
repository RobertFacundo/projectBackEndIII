import passport from 'passport';
import pkg from 'passport-local';
const LocalStrategy = pkg.Strategy;
import { usersService } from '../services/index.js';
import { createHash, passwordValidation } from '../utils/index.js'

passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const user = await usersService.getUserByEmail(email);
                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                if (!passwordValidation(password, user.password)) {
                    return done(null, false, { message: 'Incorrect password' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usersService.getUserById(id);
        if (!user) {
            
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});