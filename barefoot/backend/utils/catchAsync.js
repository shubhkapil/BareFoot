module.exports = catchAsync = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
  
      // in this function, we wrap our async functions
      // with is function, which is then called by express
      // we then execute our function which we passed here
      // if it throws error, then express knows that,
      // since the "next" function is called in the catch
      // block, the catch block is allowed as the response function
      // is async "thus it is just a promise"
    };
  };
  