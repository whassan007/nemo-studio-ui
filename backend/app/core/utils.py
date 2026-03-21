from nemo_curator.synthetic import NemotronGenerator
from typing import List

def generate_subtopics(
    generator: NemotronGenerator,
    model: str,
    model_kwargs: dict,
    macro_topic: str,
    n_subtopics: int,
    prompt_template: str,
    n_retries: int = 5
) -> List[str]:
    """
    Generates a list of subtopics for a given macro topic using a language model (LLM).
    
    This function interacts with the `generator` object to produce subtopics based on the provided
    macro topic and prompt template. If the YAML conversion fails, it retries the process up to 
    `n_retries` times.

    Args:
        generator (NemotronGenerator): The generator instance used to perform question revisions.
        model (str): The name or identifier of the language model to use.
        model_kwargs (dict): A dictionary of additional configuration parameters for the language model.
        macro_topic (str): The macro topic for which subtopics will be generated.
        n_subtopics (int): The number of subtopics to generate.
        prompt_template (str): The prompt template used to guide the LLM in generating subtopics.
        n_retries (int, optional): The maximum number of retry attempts if YAML conversion fails. Defaults to 5.

    Returns:
        List[str]: A list of generated subtopics as strings. If all retries fail, returns an empty list.

    Raises:
        YamlConversionError: If YAML conversion fails after all retry attempts.
    """
    # Initialize an empty list to store generated subtopics
    subtopics = []

    # Retry loop to handle potential YAML conversion errors
    for _ in range(n_retries):
        try:
            # Generate a response from the language model using the specified parameters
            llm_response = generator.generate_subtopics(
                model=model,
                model_kwargs=model_kwargs,
                macro_topic=macro_topic,
                n_subtopics=n_subtopics,
                prompt_template=prompt_template
            )

            # Convert the first response from the LLM into a YAML-formatted list of subtopics
            subtopics = generator.convert_response_to_yaml_list(
                llm_response=llm_response[0],
                model=model
            )

            # Exit the retry loop if conversion is successful
            break
        except YamlConversionError as e:
            # Print an error message and retry if YAML conversion fails
            print(f"Hit: {e}, Retrying...")

    # Return the generated list of subtopics (or an empty list if all retries failed)
    return subtopics