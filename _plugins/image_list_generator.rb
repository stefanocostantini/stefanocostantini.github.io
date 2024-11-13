# Create this as _plugins/image_list_generator.rb
require 'json'

module Jekyll
  class ImageListGenerator < Generator
    safe true
    
    def generate(site)
      # Get all files in the sketches directory
      sketch_files = Dir.glob("sketches/*.{jpg,jpeg,png,gif,webp}")
      
      # Create the data directory if it doesn't exist
      FileUtils.mkdir_p("_data")
      
      # Write the list to a JSON file
      File.write("_data/sketches.json", JSON.pretty_generate(sketch_files))
    end
  end
end