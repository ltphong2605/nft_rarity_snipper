import { createContext, Dispatch, SetStateAction } from 'react';

export interface IUser {
  authenticated: boolean,
  username: string, 
  email: string,
  exp: number,
  first_name: string,
  last_name: string,
  account: string,
  photo: string,
  status: string
}

export interface ITheme {
  theme: string
}

export interface ISidebarState {
  buy_now: boolean,
  not_sale: boolean,
  price_min: number,
  price_max: number,
  rarity_min: number,
  rarity_max: number,
  trait_normal: boolean,
  trait_count: boolean,
  rarity_opt: string
}

export interface AppContextProperties {
  user: IUser,
  setUser: Dispatch<SetStateAction<IUser>>,
  theme:ITheme,
  setTheme: Dispatch<SetStateAction<ITheme>>,
  sidebarState:ISidebarState,
  setSidebarState: Dispatch<SetStateAction<ISidebarState>>
}

const AppContext = createContext<AppContextProperties>({ 
  user: {
      authenticated: false,
      username: '', 
      email: '',
      exp: 0,
      first_name: '',
      last_name: '',
      account: '',
      photo: '',
      status: ''
  }, 
  setUser: () => {},
  theme: {
    theme: 'light'
  },
  setTheme: () => {},
  sidebarState: {
    buy_now: true,
    not_sale: true,
    price_min: 0,
    price_max: 100000000,
    rarity_min: 0,
    rarity_max: 100000000,
    trait_normal: false,
    trait_count: false,
    rarity_opt: ''
  },
  setSidebarState: () => {}
});

export { AppContext };
