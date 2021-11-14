$(function(){
    $('.slider__items').slick({
        prevArrow: '<button type="button" class="slick-arrows arrow-prev"><img src="../images/icon/arrow-left.svg" alt=""></button>',
        nextArrow: '<button type="button" class="slick-arrows arrow-next"><img src="../images/icon/arrow-right.svg" alt=""></button>',
        infinite: false,
    });

    var mixer = mixitup('.tovars__cards');

})