import './notify_using_cookies.style.css';

const DEFAULT_MESSAGE = 'We use cookies to make website a better place. Cookies help to provide a more personalized experience and relavant advertising for you, and web analytics for us. To learn more about the different cookies we\'re using, check out our <a href="#">Cookie Policy</a> (baked goods not included).'
const DEFAULT_ALLOW_LABEL = 'Allow cookies'
const DEFAULT_DECLINE_LABEL = 'Decline'
const USING_COOKIE_STAGE_KEY = '$UC$'

enum UsingCookiesStage {
  Accept = 'Accept',
  Decline = 'Decline'
}


export default class NotifyUsingCookies { 
  private static stage: UsingCookiesStage = NotifyUsingCookies.getStoredUsingCookieStage()
  private static banner: HTMLDivElement | null = null

  private constructor(){}

  static getStoredUsingCookieStage(): UsingCookiesStage {
    const storedValue = localStorage.getItem(USING_COOKIE_STAGE_KEY)
    if (storedValue === UsingCookiesStage.Accept) return UsingCookiesStage.Accept
    return UsingCookiesStage.Decline
  }

  static allowCookies(){
    if (NotifyUsingCookies.banner) {
      NotifyUsingCookies.banner.classList.add('hide')
    }
  }
  
  static declineCookies(){
    if (NotifyUsingCookies.banner) {
      NotifyUsingCookies.banner.classList.add('hide')
    }
  }

  static getBanner(message: string, acceptLabel: string, declineLabel: string): HTMLDivElement {
    if (NotifyUsingCookies.banner) {
      NotifyUsingCookies.banner.remove()
    }
    const banner: HTMLDivElement = document.createElement('div')
    banner.classList.add('di-notify')
    const messageEl = document.createElement('div')
    const actionEl = document.createElement('div')
    const acceptBtn = document.createElement('button')
    const declineBtn = document.createElement('button')
    
    
    messageEl.innerHTML = message
    // messageEl.textContent = message
    messageEl.classList.add('di-notify-message')

    acceptBtn.type = 'button'
    acceptBtn.textContent = acceptLabel
    acceptBtn.classList.add('di-btn-accept')
    acceptBtn.addEventListener('click', NotifyUsingCookies.allowCookies)
    
    declineBtn.type = 'button'
    declineBtn.textContent = declineLabel
    declineBtn.classList.add('di-btn-decline')
    declineBtn.addEventListener('click', NotifyUsingCookies.declineCookies)
    
    actionEl.classList.add('di-notify-action')
    actionEl.appendChild(acceptBtn)
    actionEl.appendChild(declineBtn)
    banner.appendChild(messageEl)
    banner.appendChild(actionEl)
    document.body.appendChild(banner)


    NotifyUsingCookies.banner = banner
    return banner
  }

  static showBanner(message: string = DEFAULT_MESSAGE, acceptLabel: string = DEFAULT_ALLOW_LABEL, declineLabel: string = DEFAULT_DECLINE_LABEL) {
    NotifyUsingCookies.getBanner(message, acceptLabel, declineLabel).classList.add("show")
  }
}