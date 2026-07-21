"use client"
import axios from "axios";
import { CheckCircle2, Clock, Truck, User, Video, XCircle } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Kpi from "./Kpi";
import TabButton from "./TabButton";
import { AnimatePresence,motion } from "motion/react";
import Content from "./Content";
import AdminEarning from "./AdminEarning";


type Stats = {
    pendingPartnerReviews: number
    totalApprovedPartners: number
    totalPartners: number
    totalPendingPartners: number
    totalRejectedPartners: number
}
type Tab = "partner" | "kyc"  | "vehicle"
export default function AdminDashboard(){
    const [activeTab, setActiveTab] = useState<Tab>("partner")
    const [partnerReview, setPartnerReview]  = useState<any>()
    const [pendingReview, setPendingReview]  = useState<any>()
    const [vehicleReview, setVehicleReview]  = useState<any>()
    const [pendingKyc, setPendingKyc]  = useState<any>()

    const [stats, setStats] = useState<Stats | null>(null)
    const handleGetData = async() => {
        try {
            const {data} = await axios.get("/api/admin/dashboard")
            setStats(data.stats)
            setPartnerReview(data.pendingPartnerReviews )
            setVehicleReview(data.pendingVehicles)
            console.log("admninDashboard:",data);
        } catch (error) {
            console.log(error);
            
        }
    }

    const handleGetPendingKYC = async() => {
        try {
            const {data} = await axios.get("/api/admin/video-kyc/pending")
            setPendingKyc(data);
            console.log(data);
        } catch (error) {
            console.log(error);
            
        }
    }
    useEffect(()=>{
        handleGetData(),
        handleGetPendingKYC()
    },[])
    return(
        <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
            <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image src={"/rydex.png"} alt='logo' width={58} height={58} priority />
                    
                </div>
                <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white">
                    <User size={14}/>
                    Admin Dashboard
                </div>
                
            </div>
            </div>
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <Kpi label="Total Partners" value={stats?.totalPartners}  icon={<User/>} variant={"totalPartners"}/>
                    <Kpi label="Approved Partners" value={stats?.totalApprovedPartners} icon={<CheckCircle2/>} variant={"approved"}/>
                    <Kpi label="Pending Partners" value={stats?.totalPendingPartners}  icon={<Clock/>} variant={"pending"}/>
                    <Kpi label="Rejected Partners"  value={stats?.totalRejectedPartners} icon={<XCircle/>} variant={"rejected"}/>
                </div>
                <div className="bg-white rounded-2xl p-2 shadow-lg border-gray-100 flex flex-wrap gap-2">
                    <TabButton 
                    active={activeTab=="partner"} 
                    count={partnerReview?.length ?? 0} 
                    icon={<User size={15}/>}
                    onClick={() =>setActiveTab("partner")}>Partner Reviews</TabButton>

                    <TabButton 
                    active={activeTab=="kyc"} 
                    count={pendingKyc?.length ?? 0} 
                    icon={<Video size={15}/>}
                    onClick={() =>setActiveTab("kyc")}>Pending Video KYC
                    </TabButton>
                    <TabButton 
                    active={activeTab=="vehicle"} 
                    count={vehicleReview?.length ?? 0} 
                    icon={<Truck size={15}/>}
                    onClick={() =>setActiveTab("vehicle")}>Pending Vehicle Reviews
                    </TabButton>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                    key={activeTab}
                    initial={{opacity:0, y:16}}
                    animate={{opacity:1,y:0}}
                    exit={{opacity:0, y:-8}}
                    transition={{duration:0.2, ease:"easeOut"}}
                    className="space-y-3"
                    >
                        {activeTab=='partner' && <Content data={partnerReview ?? []} type={"partner"}/>}
                        {activeTab=='kyc' && <Content data={pendingKyc ?? []} type={"kyc"}/>}
                        {activeTab=='vehicle' && <Content data={vehicleReview ?? []} type={"vehicle"}/>}
                    </motion.div>
                </AnimatePresence>
   <AdminEarning/>
            </main>
          
            
        </div> 
    )
}