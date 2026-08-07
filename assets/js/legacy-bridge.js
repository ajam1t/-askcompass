/* Legacy bridge: replaces removed inline onclick attributes with unobtrusive listeners. */
(function(){
  document.addEventListener('click', function(event){
    var actionButton = event.target.closest('[data-bc-legacy-action]');
    if(actionButton && actionButton.dataset.bcLegacyAction === 'open-bank' && typeof window.tcOpenBank === 'function'){
      window.tcOpenBank();
    }
    var screenButton = event.target.closest('[data-bc-legacy-screen]');
    if(screenButton && typeof window.tcShowScreen === 'function'){
      window.tcShowScreen(screenButton.dataset.bcLegacyScreen);
    }
    var industryButton = event.target.closest('[data-industry-name]');
    if(industryButton && typeof window.industryChange === 'function'){
      window.industryChange(industryButton.dataset.industryName, industryButton.dataset.industryText || '');
    }
  });
})();
