"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Bike, Car, CircleDashed, Icon, Package, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";


const VEHICLES = [
    {id:"bike", label:"Bike", icon:Bike, desc:"2 wheeler"},
    {id:"auto", label:"Auto", icon:Car, desc:"3 wheeler ride"},
    {id:"car", label:"Car", icon:Car, desc:"4 wheeler ride"},
    {id:"loading", label:"Loading", icon:Package, desc:"small goods"},
    {id:"truck", label:"Truck", icon:Truck, desc:"Heavy transport"},
]

export default function Page() {
    const [vehicleType,setVehicleType] = useState("")
    const [vehicleNumber,setVehicleNumber] = useState("")
    const [vehicleModel,setVehicleModel] = useState("")
    const [err,setErr] = useState("")
    const [loading, setLoading] = useState(false)

  const router = useRouter();
  const handleVehicle = async() => {
    setErr("")
    try {
      setLoading(true)
      const {data} = await axios.post("/api/partner/onboarding/vehicle",{type:vehicleType, number:vehicleNumber, vehicleModel})
      console.log(data);
      setLoading(false)
       router.push("/partner/onboarding/document")
    } catch (error:any) {
      setErr(error?.response?.data?.message || "something went wrong")
      console.log(error);
      setLoading(false)
      
    }
  }

  useEffect(() => {
    const handleGetVehicle = async() => {
    try {
      const {data} = await axios.get("/api/partner/onboarding/vehicle");
      setVehicleType(data.type)
      setVehicleNumber(data.number)
      setVehicleModel(data.vehicleModel)
      console.log(data);
    } catch (error:any) {
      console.log(error);
    }
  }
  handleGetVehicle()
  },[])
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className=" w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-xs text-gray-500 font-medium">step 1 of 3</p>
          <h1 className="text-2xl font-bold mt-1">Vehicle Details</h1>
          <p className="text-sm text-gray-500 mt-2">
            Add your vehicle information
          </p>
        </div>
        <div className="mt-8 space-y-6">
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-3">Vehicle Type</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 ">
                    {VEHICLES.map((v,i) => {
                        const Icon = v.icon
                        const active = vehicleType == v.id
                        return(
                            <motion.div
                            key={v.id}
                            whileHover={{scale:1.05}}
                            whileTap={{scale:0.96}}
                            onClick={() => setVehicleType(v.id)}
                            className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition cursor-pointer ${active ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"}`}
                            >
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${active ? "bg-white text-black" : "bg-black text-white"}`}>
                                <Icon/>
                                </div>
                                <div className="text-sm font-semibold">
                                    {v.label}
                                </div>
                                <p className={`text-xs ${active ? "text-gray-300" : "text-gray-500"}`}>
                                    {v.desc}
                                </p>

                            </motion.div>
                        )
                    })}

                </div>
            </div>
            <div>
                <label htmlFor="vn" className="text-xs font-semibold text-gray-500">Vehicle Number</label>
                <input 
                value={vehicleNumber}
                type="text" 
                id="vn" 
                placeholder="MH12AB1234" 
                className="mt-2 w-full border-b border-gray-300 pb-2 text-sm uppercase focus:outline-none focus:border-black transition"
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                />
            </div>
            <div>
                <label htmlFor="vm" className="text-xs font-semibold text-gray-500">Vehicle Model</label>
                <input 
                type="text" 
                id="vm" 
                value={vehicleModel}
                placeholder="Tata Ace" 
                className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
                onChange={(e) => setVehicleModel(e.target.value)}
                />
            </div>
            {err && <p className="text-red-500 ">*{err}</p>}
            
            <motion.button
            disabled={loading}
            whileHover={{scale:1.02}}
            whileTap={{scale:0.97}}
            className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition cursor-pointer" onClick={handleVehicle}
            > {loading?<CircleDashed className="text-white animate-spin"/>: "Continue"}
              

            </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
