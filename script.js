
// https://api.distancematrix.ai/maps/api/distancematrix/json?origins=Westminster Abbey, 20 Deans Yd, Westminster, London SW1P 3PA, United Kingdom&destinations=St John's Church, North End Rd, Fulham, London SW6 1PB, United Kingdom&key=<your_access_token>


let accessKey = `Fdy38dR4StpymzEu6acz49tdJ7Z0P`;
let accesskey2 = `a9h5JkcBSeJJoQW9Nvjbp5qyyZXHZ`;


class Delivery{

  constructor(weight, value, origin, destination, distance, timedArrival){
    this._weight = weight.value;
    this._value = value.value;
    this._origin = origin.value;
    this._destination = destination.value;
    this._timedArrival = timedArrival.value;
    this._distance = distance.value;
    this._durationTime = null;
  }

  getWeight(weight){
    this._weight = weight;

    if(this._distance && this._timedArrival && this._distance){
      this.fetchPrice(this._weight, this._value, this._distance, this._timedArrival)
    }
  }

  getValue(num){
    this._value = num;

    if(this._distance && this._timedArrival && this._distance){
      this.fetchPrice(this._weight, this._value, this._distance, this._timedArrival)
    }
  }

  getOrigin(address){
    this._origin = address;
  }

  async getDestinantion(address){
    this._destination = address;

    if(this._destination !== ""){
      let data = await Distance.getDistance(this._origin, this._destination);
      console.log(data)
      this.getDistance(data);
    }
  }

  getTimedArrival(arrival){
    this._timedArrival = parseFloat(arrival);
    this.getArrivalDate(this._timedArrival, this._durationTime);
  }


  getDistance(rawData){
    const {text:distance} = rawData.distance;
    const {text:duration} = rawData.duration;

    let myDist;
    let unit;

    this._durationTime = duration;

    if(distance.includes("km")){
      myDist = distance.replaceAll("km", "");
      unit = "km";
      myDist = myDist.trim();
    }else if(distance.includes("m")){
      myDist = distance.replaceAll("m", "");
      myDist = myDist.trim();
      unit = "m";
    }else if(distance.includes("miles")){
      myDist = distance.replaceAll("miles", "");
      myDist = myDist.trim();
      unit = "miles";
    }

    let totalDistance = Math.ceil(myDist);
    let totalDuration = duration;

    // console.log(totalDistance, unit, totalDuration);

    this._distance = totalDistance;

    this.showDistance(unit)
    this.getArrivalDate(this._timedArrival = 1,duration)
  }


  getPrice(){
    if(this._timedArrival){
      this.fetchPrice(this._weight, this._value, this._distance, this._timedArrival)
    }
  }

  fetchPrice(weight, value, distance, timedArrival){
    let perKg = 95;
    let perKm = 50;
    let delayPerDay = 200;

    let insurance = (parseFloat(value) * 4) / 100;
    let totalKg = (parseFloat(weight) * perKg);
    let totalKm = (parseFloat(distance) * perKm);
    let delay = (parseFloat(timedArrival) * delayPerDay);

    let price = insurance + totalKg + totalKm - delay;
    
    const pricing = document.querySelector("#price");
    pricing.value = ``
    pricing.value = `${price}`;

  }

  getArrivalDate(numOfDays = 1, duration){

    if(numOfDays == 1){

      let todayDate = new Date();

      let hour;
      let min;

      let durationText = duration;
      
      if(duration.includes("hour")){
        durationText = durationText.slice((duration.indexOf("r")+1), durationText.length)
        hour = parseFloat(duration.slice(0,(duration.indexOf("r"))));
      }

      if(durationText.includes("mins")){
        min = parseFloat(durationText.slice(0,(duration.indexOf("s"))));
      }

      let totalHours = hour ? (hour + 2) * 60 * 60 * 1000 : 3600000;
      let totalMin = (min) * 60 * 1000;

      let time = (todayDate.getTime()) + totalHours + totalMin;
      // console.log(time)
      let deliveryDate = (new Date(time)).toString().slice(0,25);
      let dateInput = document.querySelector("#arrival");
      dateInput.value = `${deliveryDate}`;
      
    }else if(numOfDays > 1){
      let todayDate = new Date();
      let deliveryDate = new Date(todayDate.setDate(todayDate.getDate() + numOfDays));
      let slicedDate = deliveryDate.toString().slice(0,25);
      console.log(slicedDate)
      let dateInput = document.querySelector("#arrival");
      dateInput.value = `${slicedDate}`
    }
  }


  // update display of input boxes

  updateWeight(){
    weight.value = this._weight;
  }

  updateValue(){
    value.value = FormatNum.getNum(this._value);
  }

  updateArrival(){
    timedArrival.value = this._timedArrival;
  }

  showDistance(unit){
    distance.value = `${this._distance} ${unit}`;

    if(this._distance && this._timedArrival){
      this.getPrice();
    }
  }


}

class FormatNum{
  static getNum(num){
    let data = `${(num).toLocaleString("en-US")}`;
    return data;
  }
}

class Distance{
  static async getDistance(origin, destination){
    let serverReply = await fetch(`https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${accessKey2}`);
    let reply = await serverReply.json();
    console.log(reply)
    let rawData = (reply.rows[0].elements[0])
    return rawData
  }

}

window.addEventListener("DOMContentLoaded", () => {

  const weight = document.querySelector("#weight");
  const value = document.querySelector("#value");
  const origin = document.querySelector("#origin");
  const destination = document.querySelector("#destination");
  const distance = document.querySelector("#distance");
  const timedArrival = document.querySelector("#deliveryDate");

  const calculator = new Delivery(weight, value, origin, destination, distance, timedArrival);

  weight.addEventListener("change", (e) => {
    if(weight.value < 0){
      weight.value = 1;
    }
    calculator.getWeight(e.target.value)
    calculator.updateWeight()
  })

  value.addEventListener("keyup", () => {
    if(value.value == "")return;
    let removedCommas = value.value.replaceAll(",",'');
    let number = parseFloat(removedCommas);
    calculator.getValue(number);
    calculator.updateValue();
  })

  origin.addEventListener("blur", () => {
    let address = origin.value;
    calculator.getOrigin(address)
  })

  destination.addEventListener("blur", () => {
    let address = destination.value;
    calculator.getDestinantion(address)
  })

  timedArrival.addEventListener("change", (e) => {
    calculator.getTimedArrival(e.target.value)
    calculator.getPrice()
  })

})


const resetBtn = document.querySelector("#btn");
const form = document.querySelector("#form")

resetBtn.addEventListener("click", () => {
  form.reset()
})