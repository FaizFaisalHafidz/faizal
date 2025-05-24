

export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <img
                    src="https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-garasi-amstrong.png"
                    alt="Garasi Amstrong Logo"
                    width={120}
                    height={50}
                    className="size-5 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">GARASI AMSTRONG</span>
            </div>
        </>
    );
}
