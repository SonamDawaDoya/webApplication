// Controller logic for recipes
exports.listRecipes = (req, res) => {
  // Fetch from DB later
  res.render('user/recipes', { title: 'All Recipes' });
};

exports.getRecipe = (req, res) => {
  res.send('Recipe details page (to implement)');
};
