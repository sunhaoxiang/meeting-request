$(function () {
    function popup(id, type, data) {
        var $popup = $('#popup_'+id);
        var $main = $('#main_'+id);
        bindAddBtn();
        bindRemoveBtn();

        $(document).off().on('click',function () {
            closePopup();
        });

        $('#custom_'+id).on('click',function () {
            return false;
        });

        textRemoveBtn();

        if (type == 2) {
            textDrag();
        }

        //添加显示按钮操作
        function bindAddBtn() {
            $('#add_'+id).on('click',function () {
                closePopup();
                if (type==1) {
                    createRadio();
                } else if (type==2) {
                    createMore();
                }

                $popup.show();
                moveVisible();
            });
        }

        //初始添加数据列表
        function setInitData() {
            var $ul = $('<ul>');
            $.each(data,function () {
                var $li = $('<li><span>' + this.name + '</span></li>');
                $ul.append($li);
            });
            $popup.append($ul);
        }

        //关闭弹层
        function closePopup() {
                $('.popupMenu').hide();
        }
        
        //删除指定输入框值
        function textRemoveBtn() {
            $main.delegate('em','click',function () {
                var This = this;
                var $span = $(this).parent();
                $span.remove();
                $popup.find('li').each(function () {
                    if ($(this).index()==$span.attr('nowindex')) {
                        $(this).find('span').attr('class','');
                    }
                });
            })
        }

        //删除按钮的操作
        function bindRemoveBtn() {
            $('#remove_'+id).on('click',function () {
                $main.find('em').trigger('click');
            });
        }

        //运动到可视区
        function moveVisible() {
            $popup.css('top',0);
            var popupVal = $popup.offset().top + $popup.outerHeight();
            var veiwVal = $(window).height() + $(document).scrollTop();
            if (popupVal > veiwVal) {
                $popup.animate({top : -(popupVal - veiwVal)})
            }
        }

        //创建单选
        function createRadio() {
            if (!$popup.find('ul').length) {
                setInitData();
                bindRadio();
            }
        }

        //创建多选
        function createMore() {
            if (!$popup.find('ul').length) {
                setInitData();
                setAllCus();
                bindMore();
            }
        }

        //单选操作
        function bindRadio() {
            var $span = $popup.find('span');
            $span.on('click',function () {
                if ($(this).attr('class')!='cur') {
                    $span.attr('class','');
                    $(this).attr('class','cur');
                    textRadio.add($(this).html(),$(this).parent().index());
                } else {
                    $(this).attr('class','');
                    textRadio.remove();
                }
            });
        }

        //多选操作
        function bindMore() {
            $popup.find('span').on('click',function () {
                if ($(this).attr('class')!='cur') {
                    $(this).attr('class','cur');
                    textMore.add($(this).html(),$(this).parent().index());
                } else {
                    $(this).attr('class','');
                    textMore.remove($(this).parent().index());
                }
            });
        }

        //输入单选操作
        var textRadio = (function () {
            function add(text,index) {
                var strSpan = '<span nowindex="' + index + '">' + text + '<em></em></span>';
                $main.html(strSpan);
            }
            function remove(index) {
                $main.empty();
            }
            return {
                add : add,
                remove : remove
            }
        })();

        //输入多选操作
        var textMore = (function () {
            function add(text,index) {
                var $span = $('<span nowindex="' + index + '">' + text + '<em></em></span>');
                $main.append($span);
            }
            function remove(index) {
                $main.find('span').each(function () {
                    if ($(this).attr('nowindex') == index) {
                        $(this).remove();
                    }
                });
            }
            return {
                add : add,
                remove : remove
            }
        })();

        //设置全选功能
        function setAllCus() {
            var $allCus = $('<div><a href="javascript:;">全选</a></div>');
            $popup.prepend($allCus);
            $allCus.on('click',function () {
                $popup.find('span').each(function () {
                    if ($(this).attr('class')!='cur') {
                        $(this).trigger('click');
                    }
                });
            });
        }

        //输入框拖拽排序
        function textDrag() {
            $main.delegate('span','onmouseover',function () {
                if (!$(this).siblings().length) {
                    $(this).css('cursor','default');
                } else {
                    $(this).css('cursor','move');
                }
            });

            $main.delegate('span','mousedown',function (ev) {
                var This = this;
                var cloneSpan = $(this).clone();
                $(this).css('opacity',0.5);
                cloneSpan.css({
                    'position' : 'absolute',
                    left : ev.pageX + 10,
                    top : ev.pageY + 10
                });
                $('body').append(cloneSpan);

                var $curText =  toCursor.add($(this));

                $(document).on('mousemove.drag',function (ev) {
                    cloneSpan.css({
                        left : ev.pageX + 10,
                        top : ev.pageY + 10
                    });
                    var $span = findClosest({x:ev.pageX,y:ev.pageY});
                    var centerVal = $span.offset().left + $span.width()/2;
                    if (centerVal > ev.pageX) {
                        $curText.css({
                            left : $span.offset().left,
                            top : $span.offset().top + 7
                        });
                    } else {
                        $curText.css({
                            left : $span.offset().left + $span.outerWidth(),
                            top : $span.offset().top + 7
                        });
                    }
                });

                $(document).on('mouseup.drag',function (ev) {
                    $(document).off('.drag');
                    var $span = findClosest({x:ev.pageX,y:ev.pageY});
                    var centerVal = $span.offset().left + $span.width()/2;
                    if (centerVal > ev.pageX) {
                        $(This).insertBefore($span);
                    } else {
                        $(This).insertAfter($span);
                    }
                    $(This).css('opacity',1);
                    cloneSpan.remove();
                    toCursor.remove();
                });
                return false;
            });

            //找到最近的元素
            function findClosest(page) {
                var arrY = nearY(page.y);
                return nearX(arrY,page.x);
            }

            //最近的一行
            function nearY(y) {
                var arrY = [];
                var minVal = 9999;
                var minY = 0;
                $main.find('span').each(function () {
                    var num =  Math.abs($(this).offset().top + $(this).height()/2 - y);
                    if (num < minVal) {
                        minVal = num;
                        minY = $(this).offset().top;
                    }
                });
                
                $main.find('span').each(function () {
                    if ($(this).offset().top == minY) {
                        arrY.push($(this));
                    }
                });
                return arrY;
            }

            //一行中最近的元素
            function nearX(arr,x) {
                var minVal = 9999;
                var $closestSpan = null;
                $.each(arr,function () {
                    var num =  Math.abs($(this).offset().left + $(this).width()/2 - x);
                    if (num < minVal) {
                        minVal = num;
                        $closestSpan = $(this);
                    }
                });
                return $closestSpan;
            }

            var toCursor = (function() {
                var $curText = null;
                function add($span) {
                    $curText = $('<span>|</span>');
                    $curText.css({
                        'position' : 'absolute',
                        left : $span.offset().left,
                        top : $span.offset().top + 7
                    });
                    $('body').append($curText);
                    return $curText;
                }
                function remove() {
                    $curText.remove();
                }
                return {
                    add : add,
                    remove : remove
                }
            })();
        }
    }

    popup('1000',1,[
        {name : '办公室'},
        {name : '会议室'},
        {name : '室外'},
        {name : '咖啡厅'}
    ]);

    popup('2000',1,[
        {name : '8:00~10:00'},
        {name : '12:00~13:00'},
        {name : '14:00~16:00'},
        {name : '20:00~23:00'},
        {name : '23:00~00:00'}
    ]);

    popup('3000',2,[
        {name : '李彦宏1'},
        {name : '马云1'},
        {name : '马化腾1'},
        {name : '李彦宏2'},
        {name : '马云2'},
        {name : '马化腾2'},
        {name : '李彦宏3'},
        {name : '马云3'},
        {name : '马化腾3'},
        {name : '李彦宏4'},
        {name : '马云4'},
        {name : '马化腾4'},
        {name : '李彦宏5'},
        {name : '马云5'},
        {name : '马化腾5'},
        {name : '李彦宏6'},
        {name : '马云6'},
        {name : '马化腾6'},
        {name : '李彦宏7'},
        {name : '马云7'},
        {name : '马化腾7'}
    ]);

    popup('4000',2,[
        {name : '采购部'},
        {name : '销售部'},
        {name : '策划部'},
        {name : '运维中心'},
        {name : 'IT部'},
        {name : '人力资源'},
        {name : '行政部门'},
        {name : '公关部'},
        {name : '法务部门'},
        {name : '市场部'},
        {name : '运营部'},
        {name : '游戏部门'},
        {name : '社区部门'},
        {name : '电商部门'},
        {name : '客服部'}
    ]);

});