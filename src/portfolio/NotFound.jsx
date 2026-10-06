import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="wrap grid min-h-[60dvh] place-content-center py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page does not exist.</h1>
      <Link to="/" className="btn btn-ghost mt-6 justify-self-center">Back to the portfolio</Link>
    </section>
  );
}
