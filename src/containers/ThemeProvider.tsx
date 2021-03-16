import React, { useContext } from "react";
import { ThemeProvider } from "styled-components";
import { IReqoreTheme } from "../constants/theme";
import ThemeContext from "../context/ThemeContext";

const ReqoreThemeProvider = ({ children }) => {
  const theme: IReqoreTheme = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme}>
      <>{children}</>
    </ThemeProvider>
  );
};

export default ReqoreThemeProvider;
