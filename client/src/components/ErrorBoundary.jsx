import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="p-8 max-w-xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">This page could not load</h1>
          <p>
            Your saved records remain on the server. Reload the page to try
            again.
          </p>
          <button
            className="underline"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
          <a className="block underline" href="/">
            Return home
          </a>
        </main>
      );
    return this.props.children;
  }
}
