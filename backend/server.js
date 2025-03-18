import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOptions from './config/corsSetup.js';
import colors from 'colors';
import dotenv from 'dotenv';
import AuthRoutes from './routes/AuthRoutes.js';
import UserRoutes from './routes/UserRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import BrandRoutes from './routes/BrandRoutes.js';
import CategoryRoutes from './routes/CategoryRoutes.js';
import RoleRoutes from './routes/RoleRoutes.js';
import PermissionRoutes from './routes/PermissionRoutes.js';
import TagRoutes from './routes/TagRoutes.js';
import ReviewRoutes from './routes/ReviewRoutes.js';
import CartRoutes from './routes/CartRoutes.js';
import OrderRoutes from './routes/OrderRoutes.js';
import ProductRoutes from './routes/ProductRoutes.js';

// dotenv configure
dotenv.config();

// environment variable
const PORT = process.env.PORT || 5000;

// init express
const app = express();

// set middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('*', cors(corsOptions));

// set static folder
app.use(express.static('public'));

app.use(cookieParser());

// init router
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/brand', BrandRoutes);
app.use('/api/v1/category', CategoryRoutes);
app.use('/api/v1/role', RoleRoutes);
app.use('/api/v1/permission', PermissionRoutes);
app.use('/api/v1/tag', TagRoutes);
app.use('/api/v1/review', ReviewRoutes);
app.use('/api/v1/cart', CartRoutes);
app.use('/api/v1/order', OrderRoutes);
app.use('/api/v1/product', ProductRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Branding E-commerce API' });
});

// 404 handler - This middleware must be after all routes
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`.bgBlue);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
