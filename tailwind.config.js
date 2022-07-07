module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
      display: ['Poppins', 'san serif'],
      body: ['Inconsolata', 'monospace'],
    },
    colors: {
      trips:{
        1:'#002348',
        2:'#467494',
        3:'#F87151',
        4:'#F2F3F4',
        5: '#46749499'
      },
      ukraine:{
        1:"#0057b7",
        2:"#ffd700"
      },
      rainbow:{
        1:'red',
        2:'orange',
        3:'yellow',
        4:'olive',
        5:'green',
        6:'teal',
        7:'blue',
        8:'violet',
        9:'purple',
        10:'pink',
      },
      gray: {
        100: '#edece9',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#161619',
        1000: '#0e0e0e',
        PLATINUM:'#D5D6D8'
      },

      blue:{
        1:"#1B2837",
        2:"#2F4660",
        3:"#0F2854",
        4:"#42648A",
        5:"#456990",
        6:"#467494",
        7:"#467F97",
        8:"#5A82AF",
        9:"#83A1C3",
        10:"#47949D",
        11:"#48A9A4",
        12:"#49BEAA",
        13:"#3FCAAA",
        14:"#27CE9C",
        COLORED:"#83A1C3"
      }
    },
    minHeight: {
      0: '0',
      45: '45px',
      '1/4': '25vh',
      '1/2': '50vh',
      '3/4': '75vh',
      full: '100vh',
    },
  },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
