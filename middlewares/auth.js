module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }


  if (token !== process.env.API_AUTH_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  next();
};