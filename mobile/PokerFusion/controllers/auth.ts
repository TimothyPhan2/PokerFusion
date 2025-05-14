import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class AuthController {
  private static validateEmail(email: string) {
    if (!email || email.trim() === "") {
      throw new ValidationError("Email cannot be empty");
    }
    if (!email.includes("@")) {
      throw new ValidationError("Please enter a valid email address");
    }
  }

  private static validatePassword(password: string) {
    if (!password || password.trim() === "") {
      throw new ValidationError("Password cannot be empty");
    }
    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }
  }

  private static validateProfileImage(profileImage: string) {
    if(profileImage && profileImage.trim() !== ""){

      if (!profileImage.startsWith('data:image')) {
        throw new ValidationError("Invalid image format");
      }
    }
  }

  private static validateUsername(username: string) {
    if (!username || username.trim() === "") {
      throw new ValidationError("Username cannot be empty");
    }
    if (username.length < 3) {
      throw new ValidationError("Username must be at least 3 characters long");
    }
  }

  static async handleLogin(email: string, password: string) {
    try {
      // Validate inputs
      this.validateEmail(email);
      this.validatePassword(password);

      // Login if validation passes
      const { login } = useAuthStore.getState();
      await login(email, password);

      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated.status !== true) {
        throw new Error("Login failed");
      }
      router.push("/playgame");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async handleSignup(username: string, password: string, email: string, profileImage: string) {
    try {
      // Validate inputs
      this.validateUsername(username);
      this.validateEmail(email);
      this.validatePassword(password);
      this.validateProfileImage(profileImage);

      const asset = Asset.fromModule(require("../assets/images/1.png"))
      await asset.downloadAsync();
      const localUri = asset.localUri || asset.uri;

      const base64Pfp = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 })
      
      const dataURI = `data:image/png;base64, ${base64Pfp}`

      // Signup if validation passes
      const { signup } = useAuthStore.getState();
      await signup(username, password, email, profileImage || dataURI);
      router.push("/playgame");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async handleLogout() {
    try {
      const { logout } = useAuthStore.getState();
      await logout();
      router.push("/");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
