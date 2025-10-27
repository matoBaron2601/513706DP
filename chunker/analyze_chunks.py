import tiktoken
def analyze_chunks(chunks, use_tokens=False):
    # Print the chunks of interest
    print("\nNumber of Chunks:", len(chunks))
    print("\n", "="*50, "200th Chunk", "="*50,"\n", chunks[0])
    print("\n", "="*50, "201st Chunk", "="*50,"\n", chunks[1])
    
    chunk1, chunk2 = chunks[0], chunks[1]
    
    if use_tokens:
        encoding = tiktoken.get_encoding("cl100k_base")
        tokens1 = encoding.encode(chunk1)
        tokens2 = encoding.encode(chunk2)
        
        # Find overlapping tokens
        for i in range(len(tokens1), 0, -1):
            if tokens1[-i:] == tokens2[:i]:
                overlap = encoding.decode(tokens1[-i:])
                print("\n", "="*50, f"\nOverlapping text ({i} tokens):", overlap)
                return
        print("\nNo token overlap found")
    else:
        # Find overlapping characters
        for i in range(min(len(chunk1), len(chunk2)), 0, -1):
            if chunk1[-i:] == chunk2[:i]:
                print("\n", "="*50, f"\nOverlapping text ({i} chars):", chunk1[-i:])
                return
        print("\nNo character overlap found")