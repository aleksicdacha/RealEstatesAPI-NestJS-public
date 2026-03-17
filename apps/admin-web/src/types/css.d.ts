declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module "primereact/resources/themes/*/theme.css";
declare module "primereact/resources/primereact.min.css";
declare module "primeicons/primeicons.css";
declare module "primeflex/primeflex.min.css";