(()=>{var e=document.querySelector("#videoContainer"),t=document.querySelector(".video-comments-form"),o=t.querySelector("button"),n=document.querySelector("#video-comment__delete-btn");o.addEventListener("click",(function(o){o.preventDefault();var n=t.querySelector("textarea"),c=e.dataset.videoid,d=n.value;if(""!==d){fetch("/api/videos/".concat(c,"/comment"),{method:"POST",body:JSON.stringify({text:d})}).then((function(e){console.log(e)}));var i=document.querySelector(".video-comments__list"),r=document.createElement("li");r.innerHTML="".concat(d),i.appendChild(r),n.value=""}})),null===n||n.addEventListener("click",(function(){var e=n.dataset.commentid;fetch("/api/videos/".concat(e,"/comment/delete"),{method:"POST"}).then((function(e){window.location.reload()}))}))})();