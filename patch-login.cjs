const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

code = code.replace(
  'import { signInWithPopup } from "firebase/auth";',
  'import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";'
);

const loginRegex = /const handleLogin = async \(\) => \{[\s\S]*?\}, 700\);\n  \};/;
const newLogin = `const handleLogin = async () => {
    setError("");
    const emailVal = email.trim();
    const passVal = password.trim();

    if (!emailVal || !passVal) {
      setError("Please complete all fields before continuing.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailVal, passVal);
      const user = userCredential.user;
      setLoading(false);
      onLoginSuccess({uid: user.uid, email: user.email!, name: user.displayName || "User"});
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/user-not-found') {
        setError("Uff! Aisa koi user milahi nahi. Register kiya kya?");
      } else if (err.code === 'auth/wrong-password') {
        setError("Oho! Galat password. Kahin bhool toh nahi gaye?");
      } else {
        setError(err.message || "Login failed.");
      }
    }
  };`;

code = code.replace(loginRegex, newLogin);

const signupRegex = /const handleSignup = async \(\) => \{[\s\S]*?\}, 700\);\n  \};/;
const newSignup = `const handleSignup = async () => {
    setError("");
    const nameVal = username.trim();
    const emailVal = signupEmail.trim();
    const passVal = signupPassword;
    const confirmVal = confirmPassword;

    if (!nameVal || !emailVal || !passVal || !confirmVal) {
      setError("Please complete every field to create your account.");
      return;
    }

    if (nameVal.length < 2) {
      setError("Aisa kaisa chhota naam? At least 2 letters daalo!");
      return;
    }

    if (!emailVal.includes("@") || !emailVal.includes(".")) {
      setError("Yeh email hai ya mazak? Sahi email thoko!");
      return;
    }

    if (passVal.length < 6) {
      setError("Uff, secret code thoda lamba dalo! (At least 6 keys)");
      return;
    }

    if (passVal !== confirmVal) {
      setError("Password matches nahi ho rahe! Check karo phirse.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailVal, passVal);
      const user = userCredential.user;
      await updateProfile(user, { displayName: nameVal });
      setLoading(false);
      onLisaSpeak(\`Wah kshama, naya account toh ban gaya. Chalo ab fatfat login karo aur shubharambh kijiye!\`);
      onLoginSuccess({uid: user.uid, email: user.email!, name: nameVal});
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setError("Arre! Yeh email toh pehle se registered hai.");
      } else {
        setError(err.message || "Signup failed.");
      }
    }
  };`;

code = code.replace(signupRegex, newSignup);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
console.log("Login patched!");
