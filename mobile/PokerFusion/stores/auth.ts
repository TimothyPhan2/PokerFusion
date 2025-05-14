import { create } from "zustand"

import httpService from "@/services/httpservice";
import * as SecureStore from "expo-secure-store"

interface GameHistoryItem {
    gameId: string
    amount: number
    date: string
}
export interface User {
    email: string
    password: string
    username: string
    profile_image: string
    game_history: GameHistoryItem[]
}
interface AuthState {
    isAuthenticated: { user: User | null, status: boolean }
    login: (email: string, password: string) => Promise<void>
    signup: (username: string, password: string, email: string, profileImage: string) => Promise<void>
    logout: () => Promise<void>
    getGameHistory: () => Promise<void>

}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: { user: null, status: false },
    login: async (email: string, password: string) => {
        try {
            console.log({ email, password })
            const res = await httpService.post<{ message: string, user: User }>("/user/auth-user", {
                email,
                password
            })
            const response = res

            if (response.message === "authenticated") {
                // Store only essential user data in SecureStore
                const essentialUserData = {
                    username: response.user.username,
                    email: response.user.email
                }
                await SecureStore.setItemAsync("user", JSON.stringify(essentialUserData))
                set({ isAuthenticated: { user: response.user, status: true } })
                console.log("Login successful!")
            }

        } catch (error) {
            console.log("Failed to login")
            console.log(error)
        }
    },
    signup: async (username: string, password: string, email: string, profileImage: string) => {
        try {
            console.log({ username, password, email })

            const res = await httpService.post<{ message: string, user: User }>("/user/create-user", {
                username,
                password,
                email,
                profile_image: profileImage
            })
            const response = res
            if (response.message === "User created") {
                const essentialUserData = {
                    username: response.user.username,
                    email: response.user.email
                }
                await SecureStore.setItemAsync("user", JSON.stringify(essentialUserData))
                set({ isAuthenticated: { user: response.user, status: true } })
                console.log("Signup successful!")
            } else {
                console.log("Signup failed!")
            }

        } catch (error: any) {
            console.log(error)
            if (error.response?.data?.message === "Username already exists") {
                throw new Error("Username already exists")
            }
            else if (error.response?.data?.message === "Email already exists") {
                throw new Error("Email already exists")
            }
        }
    },
    logout: async () => {
        try {
            await SecureStore.deleteItemAsync("user")
            set({ isAuthenticated: { user: null, status: false } })
            console.log("Logout successful!")
        } catch (error) {
            console.log(error)
        }
    },
    getGameHistory: async () => {
        const { isAuthenticated } = get()
        try {
            const res = await httpService.post<{ message: string, user: User }>('/user/get-user-history', {
                username: isAuthenticated.user?.username
            })
            const response = res
            if (response.message === "User history fetched") {
                const essentialUserData = {
                    username: response.user.username,
                    email: response.user.email
                }
                await SecureStore.setItemAsync("user", JSON.stringify(essentialUserData))
                set({ isAuthenticated: { user: response.user, status: true } })
                console.log("User history fetched successfully!")
            } else {
                console.log("User history fetch failed!")
            }
        } catch (error) {
            console.log(error)
        }
    }
}))