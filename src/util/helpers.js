module.exports = {
   timeStampFormat: "YYYY-MM-DD HH:mm:00",
   dateFormat:"YYYY-MM-DD",
    getRandomStr(length) {
        let result = "";
        const characters= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     },
     getRandomNumber: function(){
         return Math.floor(100000 + Math.random() * 900000);
     },
     mapImageHost(imageFileName) {
        if(imageFileName)
           return process.env.HOST+"/uploads/"+imageFileName;
         else{
            return "";
         }
     },
     roundNumber(number){
        return Math.round((number + Number.EPSILON) * 100) / 100;
     }
};