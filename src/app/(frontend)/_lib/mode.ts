export const modeKey = 'mode'

/**
 * Light unless the reader chose dark on this site. The choice stays in this
 * browser (localStorage), as an interface preference; nothing leaves it.
 */
export const modeScript = `try{if(localStorage.getItem('${modeKey}')==='dark')document.documentElement.dataset.mode='dark'}catch(e){}`
