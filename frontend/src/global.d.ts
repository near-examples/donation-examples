declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css'; // optional: for normal CSS imports
