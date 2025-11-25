// Ambient module declarations for untyped JS packages used in the project.
declare module 'reflect-metadata';
declare module 'express';
declare module 'compression';
declare module 'express-rate-limit';

// Allow importing CSS/HTML in TS if any build step references them.
declare module '*.css';
declare module '*.html';
