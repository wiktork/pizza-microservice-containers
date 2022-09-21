
$(document).ready(function(){

    var orderStatus = 'Created';
    var statusNumber;

    $('.order-search').click(function(event){
        var orderNumber = $('.order-number').val();

        $('.searched-order-status').text("Order Status for "+orderNumber);
        if (orderNumber != null)
        {
            $.get(`/getOrderStatus/${orderNumber}`, function(data,status,xhr){
                clearDisplayStatus();
                orderStatus = JSON.stringify(data);
                console.log("Order status: "+ orderStatus);
                console.log("/getOrderStatus response status: "+status);
                console.log("is order status InProgress: "+ (orderStatus == JSON.stringify('InProgress')));
                console.log("is order status Ready: "+ (orderStatus == JSON.stringify('Ready')));
                if(orderStatus == JSON.stringify('InProgress'))
                {
                    statusNumber = 1;
                }else if (orderStatus == JSON.stringify('Ready'))
                {
                    statusNumber = 2;
                }
                else
                {
                    statusNumber = 0;
                }
                console.log("in displayStatus function after if else statement: "+ statusNumber);
                displayStatus()
              })
        }
    })

    function displayStatus(){

        console.log("in displayStatus function. statusNumber here is: "+statusNumber);
        $('#order-inProgress').addClass(statusNumber>0? 'completed':'');
        $('#order-ready').addClass(statusNumber>1? 'completed':'');
    }

    function clearDisplayStatus(){
        $('#order-inProgress').removeClass('completed');
        $('#order-ready').removeClass('completed');

    }

    //displayStatus(orderStatus);
  
  });



