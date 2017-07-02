// Custom file drop extension
/*
 And we can use it like this

 // Event listener filedropper
 $('.dropbox').filedrop({
 callback : function(fileEncryptedData) {
 // a callback?
 }
 });
 */

$.fn.extend({
	filedrop : function(options) {
		var defaults = {
			callback : null
		}
		options = $.extend(defaults, options)
		return this.each(function() {
			var files = []
			var $this = $(this)

			// Stop default browser actions
			$this.bind('dragover', function(event) {
				event.stopPropagation()
				event.preventDefault()
				if (!$this.hasClass("hover")) {
					$this.addClass("hover");
				}
			});
			$this.bind('dragleave', function(event) {
				event.stopPropagation()
				event.preventDefault()
				if ($this.hasClass("hover")) {
					$this.removeClass("hover");
				}
			});

			// Catch drop event
			$this.bind('drop', function(event) {
				// Stop default browser actions
				event.stopPropagation()
				event.preventDefault()

				// Get all files that are dropped
				files = event.originalEvent.target.files
						|| event.originalEvent.dataTransfer.files

				// Convert uploaded file to data URL and pass trought callback
				if (options.callback) {
					options.callback(files[0]);
				}
				return false
			})
		})
	}
})