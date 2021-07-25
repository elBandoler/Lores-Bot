export function formatCurrentDateTime() : string
{
    var date = new Date()
    var year : String = date.getFullYear().toString()
    var month : String = date.getMonth().toString()
    var day : String = date.getDay().toString()
    var hour : String = date.getHours().toString()
    var minute : String = date.getMinutes().toString()
    var second : String = date.getSeconds().toString()

    return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")} @ ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`
}