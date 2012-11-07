(function($) {
    $.fn.splitter = function(startPOS) {
        return this.each(function() {
            var $this = $(this);
            $this.height($this.parent().height());
            $this.width("8px");
            $this.css("background-color", "black");
            
            var splitMiddle = $this.width() / 2;

            var parentsChilds = $this.parent()[0].children;
            var left, right, foundme, done;
            for (var child in parentsChilds) {
                if (!done) {
                    if (!foundme) {
                        if (parentsChilds[child] === this) {
                            foundme = true;
                        }else{
                            left = parentsChilds[child];
                        }
                    }else{
                        done = true;
                        right =    parentsChilds[child];
                    }
                }
            }
            setpost(startPOS);
            function setpost(pos){
                $this.css("left", pos);
                $(left).css("right",  $(window).width() - pos);
                $(right).css("left", pos + $this.width());
            }
            
            $(window).resize(function(){
                setpost($(left).width());
                $this.height($this.parent().height());
            });
            
            $this.mousedown(function(e) {
                var isMoving = true;
                var move = function(e) {
                    if (isMoving) 
                        setpost( e.pageX - splitMiddle);
                };
                $this.mouseup(function() {
                    isMoving = false;
                });
                $(window).mousemove(move);
            });

        });
    };
})(jQuery);