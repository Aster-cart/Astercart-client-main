// import { useEffect, useState } from "react";

// const useResetPassword=(newPassword:string) => {
    
//     const [secondsLeft, setSecondsLeft] = useState(30);
//     const [isResetting, setIsResetting] = useState(false);
//     const [resetToken, setResetToken] = useState("");

//     // useEffect(() => {
//     //     if (isResetting) {
//     //         const interval = setInterval(() => {
//     //             if (secondsLeft > 0) {
//     //                 setSecondsLeft(secondsLeft - 1);
//     //             } else {
//     //                 clearInterval(interval);
//     //                 setIsResetting(false);
//     //             }
//     //         }, 1000);
//     //         return () => clearInterval(interval);
//     //     }
//     // }, [isResetting, secondsLeft]);
    
// }

// export default useResetPassword;