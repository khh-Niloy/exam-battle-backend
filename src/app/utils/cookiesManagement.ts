import { Response } from "express";

export const setCookie = (
  res: Response,
  accessToken?: string,
  refreshToken?: string
) => {
  if (accessToken) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
       sameSite: "none",
    });
  }
};

export const clearCookie = (res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
};

export const cookiesManagement = {
  setCookie,
  clearCookie,
}

