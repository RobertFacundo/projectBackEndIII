import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.cookies['coderCookie'] || req.cookies['unprotectedCookie'];
    if (!token) {
        return res.status(401).send({ status: 'error', errr: 'No token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({
                status: 'error',
                error: 'Forbidden',
                details: err.message
            });
        }
        req.user = user;
        next();
    });
};

export { authenticateJWT }