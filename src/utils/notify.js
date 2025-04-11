import { Notify } from "quasar";

export const notifySuccess = (message) => {
  Notify.create({
    message,
    color: "green",
    icon: "check_circle",
  });
};

export const notifyFailure = (message) => {
  Notify.create({
    message,
    color: "red",
    icon: "error",
  });
};

export const notifyInfo = (message) => {
  Notify.create({
    message,
    color: "blue",
    icon: "info",
  });
};
