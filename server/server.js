import { readFileSync } from 'fs';
import { ApolloServer, gql } from 'apollo-server-express';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import expressJwt from 'express-jwt';
import { sign } from 'jsonwebtoken';
import { users } from './db';
import resolvers from './resolvers';

const port = 9000;
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

const app = express();
app.use(
  cors(),
  json(),
  expressJwt({
    secret: jwtSecret,
    credentialsRequired: false,
  })
);

// setup up apollo server
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf8' }));
const apolloServer = new ApolloServer({ typeDefs, resolvers });
apolloServer.applyMiddleware({ app, path: '/graphql' });

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.list().find(user => user.email === email);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = sign({ sub: user.id }, jwtSecret);
  res.send({ token });
});

app.listen(port, () => console.info(`server is listening on http://localhost:${port}/graphql`));
