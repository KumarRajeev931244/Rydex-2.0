
export default function ActionCard({icon,title,button,onclick}:any){
    return (
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg border flex  sm:flex-row  items-start sm:items-center gap-5">
            <div className="flex items-center justify-center gap-4">
                <div className="bg-black text-white p-3 md:p-4 rounded-xl shrink-0">
                    {icon}
                </div>
                <div className="text-base sm:text-lg md:text-xl font-semibold">{title}</div>
                <button 
            className=" flex items-end justify-end gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors"
            onClick={onclick}>Join call</button>
            </div>
            

        </div>
    )
}