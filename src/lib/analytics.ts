import ReactGA from "react-ga4";

export const initAnalytics = () => {
  ReactGA.initialize("G-WMG5GNQ8G7");
  ReactGA.send("pageview");
};