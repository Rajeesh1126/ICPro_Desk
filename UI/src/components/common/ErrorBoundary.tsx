import { Component, type ReactNode } from "react";
import ErrorPage from "../../pages/ErrorPage";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Keep technical details out of the UI; monitoring can be added here later.
  }

  render() {
    if (this.state.hasError) return <ErrorPage code="generic" />;
    return this.props.children;
  }
}
