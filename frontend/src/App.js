import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import MyCourses from "@/pages/MyCourses";
import CourseDetail from "@/pages/CourseDetail";
import LiveClasses from "@/pages/LiveClasses";
import Assignments from "@/pages/Assignments";
import Payments from "@/pages/Payments";
import Profile from "@/pages/Profile";
import Instructor from "@/pages/Instructor";
import Checkout from "@/pages/Checkout";
import PaymentStatus from "@/pages/PaymentStatus";
import PlanDetails from "@/pages/PlanDetails";
import BookTrial from "@/pages/BookTrial";
import CoursesCatalog from "@/pages/CoursesCatalog";

function App() {
    useEffect(() => {
        document.getElementById("emergent-badge")?.remove();
    }, []);

    return (
        <AuthProvider>
            <div className="App">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/courses" element={<CoursesCatalog />} />
                        <Route path="/login" element={<Auth mode="login" />} />
                        <Route path="/signup" element={<Auth mode="signup" />} />
                        <Route path="/plans/:planId" element={<PlanDetails />} />
                        <Route path="/enroll/:planId" element={<PlanDetails />} />
                        <Route path="/book-trial" element={<BookTrial />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/payment-status/:paymentId" element={<PaymentStatus />} />

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/courses" element={<MyCourses />} />
                        <Route path="/dashboard/courses/:id" element={<CourseDetail />} />
                        <Route path="/dashboard/live" element={<LiveClasses />} />
                        <Route path="/dashboard/assignments" element={<Assignments />} />
                        <Route path="/dashboard/payments" element={<Payments />} />
                        <Route path="/dashboard/profile" element={<Profile />} />

                        <Route path="/instructor" element={<Instructor />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <Toaster theme="dark" richColors position="bottom-right" />
            </div>
        </AuthProvider>
    );
}

export default App;
