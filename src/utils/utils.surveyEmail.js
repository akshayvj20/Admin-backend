

module.exports = function(survey) {

return  `<html>
  
<head><link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi">
  <title>Survey template</title>
  <meta property="og:title" content="Email template">
  
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<meta http-equiv="X-UA-Compatible" content="IE=edge">

<meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <style type="text/css">
 
    a{ 
      text-decoration: underline;
      color: inherit;
      font-weight: bold;
      color: #253342;
    }
    
    h1 {
      font-size: 56px;
    }
    
      h2{
      font-size: 28px;
      font-weight: 900; 
    }
    
    p {
      font-weight: 100;
    }
    
    td {
  vertical-align: top;
    }
    
    #email {
      margin: auto;
      width: 600px;
      background-color: white;
    }
    
    button{
      font: inherit;
      background-color: #FF7A59;
      border: none;
      padding: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 900; 
      color: white;
      border-radius: 5px; 
      box-shadow: 3px 3px #d94c53;
    }
    
    .subtle-link {
      font-size: 9px; 
      text-transform:uppercase; 
      letter-spacing: 1px;
      color: #CBD6E2;
    }
    
  </style>
  
</head>
  
  <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word">

    
<div id="email">

<! Banner --> 
       <table role="presentation" width="100%">
          <tr>
       
            <td bgcolor="#00A4BD" align="center" style="color: white;">
          
           <img alt="image" src="cid:image">
              
            
              
            </td>
      </table>




  <! First Row --> 

<table role="presentation" border="0" cellpadding="0" cellspacing="10px" style="padding: 30px 30px 30px 60px;">
   <tr>
     <td>
      <h2> ${survey.surveyName}</h2>
          <p>
            Ut eget semper libero. Vestibulum non maximus nisl, ut iaculis ante. Nunc arcu elit, cursus eget urna et, tempus aliquam eros. Ut eget semper libero. Vestibulum non maximus nisl, ut iaculis ante. Nunc arcu elit, cursus eget urna et, tempus aliquam eros.  
          </p>
              
        </td> 
        </tr>
               </table>
    </div>
  </body>
    </html>`
}