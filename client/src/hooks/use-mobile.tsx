import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Log detection for debugging
    setTimeout(() => {
      console.log(`Mobile detection: ${window.innerWidth < MOBILE_BREAKPOINT ? 'Mobile' : 'Desktop'} (width: ${window.innerWidth}px)`);
    }, 500);
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
