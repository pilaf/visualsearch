(function() {

var $ = jQuery; // Handle namespaced jQuery

// The model that holds individual search facets and their categories.
// Held in a collection by `VS.app.searchQuery`.
VS.model.SearchFacet = Backbone.Model.extend({

  // Extract the category and value and serialize it in preparation for
  // turning the entire searchBox into a search query that can be sent
  // to the server for parsing and searching.
  serialize : function() {
    var category = this.quoteCategory(this.get('category'));
    var value    = VS.utils.inflector.trim(this.get('value'));
    var remainder = this.get("app").options.remainder;
    var categorizeRemainder = this.get("app").options.categorizeRemainder;

    if (!value) return '';

    // XXX: ugly hack and suboptimal solution. Using the keyboard to select a
    // category with spaces in its name results in the creation of a default
    // facet with the category's name as its value, so for now I'm just
    // forbidding the user to search for a category name in the default facet.
    //
    var categories = this.get('app').options.callbacks.facetMatches(function(facets) {
      return _.map(facets, function(facet) {
        return facet.label || facet;
      });
    });
    if(category === remainder && _.contains(categories, value))
      return '';

    if (!_.contains(this.get("app").options.unquotable || [], category) &&
      (category != remainder || categorizeRemainder)) {
      value = this.quoteValue(value);
    }

    if (category != remainder || categorizeRemainder) {
      category = category + ': ';
    } else {
      category = "";
    }
    return category + value;
  },
  
  // Wrap categories that have spaces or any kind of quote with opposite matching
  // quotes to preserve the complex category during serialization.
  quoteCategory : function(category) {
    var hasDoubleQuote = (/"/).test(category);
    var hasSingleQuote = (/'/).test(category);
    var hasSpace       = (/\s/).test(category);
    
    if (hasDoubleQuote && !hasSingleQuote) {
      return "'" + category + "'";
    } else if (hasSpace || (hasSingleQuote && !hasDoubleQuote)) {
      return '"' + category + '"';
    } else {
      return category;
    }
  },
  
  // Wrap values that have quotes in opposite matching quotes. If a value has
  // both single and double quotes, just use the double quotes.
  quoteValue : function(value) {
    var hasDoubleQuote = (/"/).test(value);
    var hasSingleQuote = (/'/).test(value);
    
    if (hasDoubleQuote && !hasSingleQuote) {
      return "'" + value + "'";
    } else {
      return '"' + value + '"';
    }
  },
  
  // If provided, use a custom label instead of the raw value.
  label : function() {
      return this.get('label') || this.get('value');
  }

});

})();
