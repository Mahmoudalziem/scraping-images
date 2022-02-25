import express from 'express'
import path from 'path'

const app = express();

/// Routes

import indexRoutes from './routes/indexRoutes'

app.use(express.json({ limit: '500MB' }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve('public')));

app.use('/', indexRoutes);

export default app;