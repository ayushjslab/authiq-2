"use client";

import React from 'react'
import { createAuthClient } from "better-auth/client"
import { FcGoogle } from "react-icons/fc"
import { HiOutlineShieldCheck } from "react-icons/hi"

const authClient = createAuthClient()

const SignInPage = () => {
    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard"
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8 p-8 bg-card border border-border rounded-3xl shadow-xl">
                {/* Logo */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                        <HiOutlineShieldCheck size={32} />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold font-heading text-card-foreground">Welcome to Authiq</h1>
                        <p className="text-muted-foreground mt-2">Monitor and manage your API health with ease.</p>
                    </div>
                </div>

                {/* Sign-In Actions */}
                <div className="space-y-4 pt-4">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full h-14 flex items-center justify-center space-x-3 bg-white border border-border rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm active:scale-[0.98]"
                    >
                        <FcGoogle size={24} />
                        <span>Continue with Google</span>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">or</span>
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground px-8 leading-relaxed">
                        By continuing, you agree to our <span className="underline underline-offset-4 hover:text-primary cursor-pointer transition-colors hover:text-primary/80">Terms of Service</span> and <span className="underline underline-offset-4 hover:text-primary cursor-pointer transition-colors hover:text-primary/80">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignInPage
