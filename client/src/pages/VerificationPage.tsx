import { useNavigate } from "react-router-dom";
import Verify from "../assets/veriy.svg";
import "../styles/App.css";
import {
  useState,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  FocusEvent,
} from "react";
import successToast from "../components/toast/successToast";
import errorToast from "../components/toast/errorToast";

const VerificationPage = () => {
  const [value, setValue] = useState<string[]>(new Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();

  const onChangeHandler = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValue = event.target.value;

    if (isNaN(Number(inputValue)) || inputValue.length > 1) {
      setErrorMessage("Please enter only numbers");
      return;
    }

    setErrorMessage("");
    const newValue = [...value];
    newValue[index] = inputValue;
    setValue(newValue);

    if (inputValue && index < value.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const gotToLogin = () => {
    navigate("/login");
  };

  const onKeyDownHandler = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace") {
      if (value[index] === "") {
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        const newValue = [...value];
        newValue[index] = "";
        setValue(newValue);
      }
    }
  };

  const onFocusHandler = (event: FocusEvent<HTMLInputElement>) => {
    event.target.placeholder = "";
  };

  const onBlurHandler = (
    event: FocusEvent<HTMLInputElement>,
    index: number
  ) => {
    if (value[index] === "") {
      event.target.placeholder = "0";
    }
  };

  const handleOTPVerification = async (enteredOtp: string) => {
    try {
      // Retrieve the OTP, username, and email from local storage
      const otp = localStorage.getItem("otp");
      const username = localStorage.getItem("username");
      const email = localStorage.getItem("email");

      if (!otp || !username || !email) {
        throw new Error("Missing OTP, username, or email in local storage");
      }
      const bool = otp === enteredOtp;
      console.log(bool);
      const response = await fetch("http://127.0.0.1:1991/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: bool,
          username: username,
          email: email,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Check if entered OTP matches OTP from backend
        gotToLogin();
      } else {
        errorToast("OTP verification failed!");
      }
    } catch (err) {
      errorToast("An error occurred during OTP verification!");
      console.error(err);
    }
  };
  const handleSubmit = () => {
    const enteredOtp = value.join("");
    handleOTPVerification(enteredOtp);
  };

  return (
    <div className="flex flex-col flex-1 h-screen">
      <div className="flex flex-[7] ">
        <div className="flex flex-col flex-1 items-center justify-center">
          <h1 className="text-4xl font-bold">Verify Your Email Address</h1>
          <div className="flex mt-10 text-2xl">
            <h1>Please enter the OTP we sent you!</h1>
          </div>
          <div className="flex flex-col space-y-10 mt-6">
            <div className="flex space-x-2">
              {value.map((item, index) => (
                <input
                  key={index}
                  value={item}
                  placeholder="0"
                  className="w-16 h-16 p-3 border bg-green-900 text-white text-center text-xl rounded-lg focus:border-white focus:outline-white"
                  onChange={(e) => onChangeHandler(e, index)}
                  onKeyDown={(e) => onKeyDownHandler(e, index)}
                  onFocus={onFocusHandler}
                  onBlur={(e) => onBlurHandler(e, index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                />
              ))}
            </div>
            {errorMessage && (
              <div className="text-red-500 text-xl">{errorMessage}</div>
            )}
          </div>
          <button
            className="bg-green-900 text-white pl-20 pr-20 pt-4 pb-4 rounded-2xl hover:bg-green-900 hover:text-white transition-transform transform hover:scale-110 rounded-full mt-10 text-2xl"
            onClick={handleSubmit}
          >
            <span>Enter</span>
          </button>
        </div>
        <div className="flex flex-1 justify-center items-center">
          <img src={Verify} className="login" alt="Verification" />
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
