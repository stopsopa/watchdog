
import React from 'react';

import log from 'inspc'

import se from 'nlab/se';

/**
 * This technique of handling errors seems to be convenient but it has one problem
 * You can't recover from it "easily"
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  /**
   * Called first
   * It' looks like it is not necessary to catch async recoil selector error
   */
  static getDerivedStateFromError(error) {

    // log.dump({
    //   getDerivedStateFromError: se(error),
    // })

    // Update state so the next render will show the fallback UI.
    return { error: se(error) };
  }

  /**
   * Called second
   */
  componentDidCatch(error, errorInfo) {

    // log.dump({
    //   componentDidCatch: se(error),
    //   errorInfo,
    // })

    // Catch errors in any components below and re-render with error message
    this.setState({
      error: se(error),
      errorInfo: (function (e) {

        if ( typeof e.componentStack === 'string' ) {

          e.componentStack = e.componentStack.split("\n").filter(Boolean)
        }

        return e
      }(errorInfo)),
    })

    // // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {

    if (this.state.error) {

      // You can render any custom fallback UI
      return (
        <>
          <h1>🐛 Error: Something went wrong.</h1>
          <pre>{JSON.stringify(this.state, null, 4)}</pre>
        </>
      );
    }

    return this.props.children;
  }
}
