/* SystemJS module definition */
declare var module: NodeModule;
declare module '*.json';
declare var google: any;
interface NodeModule {
  id: string;
}
// Since Stripe.js is added outside the scope of the project and doesn’t have typings,
// TypeScript would normally complain when trying to access stripe or elements.
// To fix this, we’ll add two declarations
declare var stripe: any;
declare var elements: any;
