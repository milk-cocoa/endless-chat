$(function() {
    //1.ミルクココアインスタンスを作成
    var milkcocoa = new MilkCocoa("app_id.mlkcca.com");

    //2."message"データストアを作成
    var ds = milkcocoa.dataStore("message");
    var stream = ds.stream().sort("desc");

    var windowHeight = $(window).height();
    var bodyHeight = $('body').height();

    function recalcHeights(){
      windowHeight = $(window).height();
      bodyHeight = $('body').height();
    }

    $(window).on('resize', $.debounce( 200, function(){
        recalcHeights();
      })
    );

    function getData(callback) {

      $(window).off('scroll');

      stream.next(function(err, elems) {

        if(elems.length == 0){
          callback();
          return;
        }

        var reversedElems = elems.reverse();

        reversedElems.forEach(function(el) {
          renderMessage(el);
        });

        recalcHeights();

        $(window).on('scroll',
          $.throttle( 200, function(){
            if( ($(window).scrollTop() + windowHeight) > (bodyHeight - 300) ) getData(callback);
          })
        );
      });
    }

    getData(function(){
      $("#messages").append('<div style="color: #DB6220; margin-top: 30px; text-align: center;">全データを読み込みました</div>');
    });

    //4."message"データストアのプッシュイベントを監視
    ds.on("push", function(pushed) {
        renderMessage(pushed, true);
    });

    function renderMessage(message, before) {
        var message_html = '<p class="post-text">' + escapeHTML(message.value.content) + '</p>';
        var date_html = '';
        if(message.value.date) {
            date_html = '<p class="post-date">'+escapeHTML( new Date(message.value.date).toLocaleString())+'</p>';
        }
        if(before) $("#messages div:first-child").before('<div id="'+message.id+'" class="post">'+message_html + date_html +'</div>');
        else $("#messages").append('<div id="'+message.id+'" class="post">'+message_html + date_html +'</div>');
    }

    function post() {
        //5."message"データストアにメッセージをプッシュする
        var content = escapeHTML($("#content").val());

        if (content && content !== "") {
            ds.push({
                title: "タイトル",
                content: content,
                date: new Date().getTime()
            }, function (e) {});
        }
        $("#content").val("");
    }

    $('#post').click(function () {
        post();
    })
    $('#content').keydown(function (e) {
        if (e.which == 13){
            post();
            return false;
        }
    });
});
//インジェクション対策
function escapeHTML(val) {
    return $('<div>').text(val).html();
};