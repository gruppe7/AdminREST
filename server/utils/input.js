
function checkSemester(semester){
  if(semester==null){
    return false;
  }
  if(semester.length==5){
    var array=semester.split();
    var year = array[0]+array[1]+array[2]+array[3];
    if(checkYear(year)){
      if(array[4]!='v' && array[4]!='h'){
        return false;
      }else {
        return true;
      }
    }else{
      return false;
    }
  }else{
    return false;
  }
}
function checkYear(year){
  if(year==null){
    return false;
  }
  if(year===parseInt(year, 10)){
    if(year>1900){
      return true;
    }else {
      return false;
    }
  }else {
    return false;
  }
}

module.exports={checkYear:checkYear, checkSemester:checkSemester};
